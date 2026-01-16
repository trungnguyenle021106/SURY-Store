using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Application.MediatR.CQRS;
using Catalog.Application.Common.Interfaces;
using Catalog.Application.CQRS.Products.Queries.GetProduct;
using Catalog.Application.CQRS.Products.Queries.GetProduct.Catalog.Application.CQRS.Products.Queries.GetProduct;
using Catalog.Domain.Entities;
using Catalog.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace Catalog.Application.CQRS.Products.Queries.GetProduct
{
    public class GetProductsHandler : IRequestHandler<GetProductsQuery, GetProductsResult>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache;

        // Định nghĩa tên của Master Key
        private const string ProductMasterKey = "product-master-key";

        public GetProductsHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
        {
            var version = await _cache.GetStringAsync(ProductMasterKey, cancellationToken);
            if (string.IsNullOrEmpty(version))
            {
                version = Guid.NewGuid().ToString(); // Nếu chưa có thì tạo version mới
                await _cache.SetStringAsync(ProductMasterKey, version, cancellationToken);
            }

            string cacheKey = $"products:{version}:{GenerateCacheKeyFromQuery(query)}";

            PaginatedResult<ProductDto>? resultData = null;

            if (!query.BypassCache)
            {
                var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    resultData = JsonSerializer.Deserialize<PaginatedResult<ProductDto>>(cachedData);
                }
            }

            if (resultData != null) return new GetProductsResult(resultData);

            var productsQuery = _dbContext.Products.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var keyword = query.Keyword.Trim();
                productsQuery = productsQuery.Where(p => p.Name.Contains(keyword) || p.Description.Contains(keyword));
            }

            if (!query.IncludeDrafts) productsQuery = productsQuery.Where(p => p.Status != ProductStatus.Draft);
            if (query.CategoryId.HasValue) productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId.Value);
            if (query.ExcludeId.HasValue) productsQuery = productsQuery.Where(p => p.Id != query.ExcludeId.Value);

            var paginatedProducts = await productsQuery
                .OrderBy(p => p.Name)
                .ToPaginatedListAsync<Product, ProductDto>(query.PageNumber, query.PageSize, cancellationToken);

            var cacheOptions = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));

            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(paginatedProducts), cacheOptions, cancellationToken);

            return new GetProductsResult(paginatedProducts);
        }

        private string GenerateCacheKeyFromQuery(GetProductsQuery query)
        {
            return $"{query.PageNumber}:{query.PageSize}:" +
                   $"{(query.CategoryId.HasValue ? query.CategoryId.ToString() : "all")}:" +
                   $"{(string.IsNullOrWhiteSpace(query.Keyword) ? "nokey" : query.Keyword.Trim().ToLower())}:" +
                   $"{(query.ExcludeId.HasValue ? query.ExcludeId.ToString() : "noex")}:" +
                   $"{(query.IncludeDrafts ? "w_draft" : "no_draft")}";
        }
    }
}