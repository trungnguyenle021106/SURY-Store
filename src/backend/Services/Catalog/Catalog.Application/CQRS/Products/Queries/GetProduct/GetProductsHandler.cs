using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Application.MediatR.CQRS;
using Catalog.Application.Common.Interfaces;
using Catalog.Application.CQRS.Products.Queries.GetProduct.Catalog.Application.CQRS.Products.Queries.GetProduct;
using Catalog.Domain.Entities;
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

        public GetProductsHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
        {
            // 1. Tạo Key Cache (như cũ)
            string cacheKey = GenerateCacheKeyFromQuery(query);

            PaginatedResult<ProductDto>? resultData = null;

            // 2. CHECK CACHE: Chỉ đọc cache nếu KHÔNG CÓ lệnh Bypass
            if (!query.BypassCache)
            {
                var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    resultData = JsonSerializer.Deserialize<PaginatedResult<ProductDto>>(cachedData);
                }
            }

            // 3. Nếu có cache và không bypass -> Trả về luôn
            if (resultData != null)
            {
                return new GetProductsResult(resultData);
            }

            // ---------------------------------------------
            // 4. Nếu xuống đây nghĩa là:
            //    - Hoặc Cache chưa có (Miss)
            //    - Hoặc Admin yêu cầu Bypass (Force Refresh)
            // ---------------------------------------------

            // 5. Query Database (Code cũ giữ nguyên)
            var productsQuery = _dbContext.Products.AsNoTracking();
            // ... (Các đoạn if filter keyword, category giữ nguyên) ...

            var paginatedProducts = await productsQuery
                .OrderBy(p => p.Name)
                .ToPaginatedListAsync<Product, ProductDto>(
                    query.PageNumber,
                    query.PageSize,
                    cancellationToken);

            // 6. LƯU CACHE (Quan trọng):
            // Dù là lần đầu hay là Bypass, ta đều lưu đè kết quả mới nhất vào Redis
            // để các User sau đó sẽ được hưởng dữ liệu mới này.
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));

            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(paginatedProducts),
                cacheOptions,
                cancellationToken);

            return new GetProductsResult(paginatedProducts);
        }

        private string GenerateCacheKeyFromQuery(GetProductsQuery query)
        {
            return $"products:{query.PageNumber}:{query.PageSize}:" +
                   $"{(query.CategoryId.HasValue ? query.CategoryId.ToString() : "all")}:" +
                   $"{(string.IsNullOrWhiteSpace(query.Keyword) ? "nokey" : query.Keyword.Trim().ToLower())}:" +
                   $"{(query.ExcludeId.HasValue ? query.ExcludeId.ToString() : "noex")}:" +
                   $"{(query.IncludeDrafts ? "w_draft" : "no_draft")}";
        }
    }
}