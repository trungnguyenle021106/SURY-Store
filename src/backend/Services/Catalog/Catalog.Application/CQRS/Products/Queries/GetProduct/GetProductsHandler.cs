using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Application.MediatR.CQRS;
using Catalog.Application.Common.Interfaces;
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

        // Định nghĩa tên của Master Key để quản lý version cache
        private const string ProductMasterKey = "product-master-key";

        public GetProductsHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
        {
            // 1. Lấy hoặc tạo Version cache (để khi update sản phẩm chỉ cần đổi version này là clear hết cache cũ)
            var version = await _cache.GetStringAsync(ProductMasterKey, cancellationToken);
            if (string.IsNullOrEmpty(version))
            {
                version = Guid.NewGuid().ToString();
                await _cache.SetStringAsync(ProductMasterKey, version, cancellationToken);
            }

            // 2. Tạo Cache Key (Bao gồm cả Status mới thêm)
            string cacheKey = $"products:{version}:{GenerateCacheKeyFromQuery(query)}";

            PaginatedResult<ProductDto>? resultData = null;

            // 3. Kiểm tra Cache (nếu không yêu cầu bypass)
            if (!query.BypassCache)
            {
                var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    resultData = JsonSerializer.Deserialize<PaginatedResult<ProductDto>>(cachedData);
                }
            }

            if (resultData != null) return new GetProductsResult(resultData);

            // 4. Truy vấn Database nếu không có Cache
            var productsQuery = _dbContext.Products.AsNoTracking();

            // -- Lọc theo từ khóa (Tên hoặc Mô tả)
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var keyword = query.Keyword.Trim();
                productsQuery = productsQuery.Where(p => p.Name.Contains(keyword) || p.Description.Contains(keyword));
            }

            // -- Lọc theo Trạng thái (Logic mới cập nhật) --
            if (query.Status.HasValue)
            {
                // Ưu tiên 1: Nếu người dùng chọn Status cụ thể -> Lọc cứng theo Status đó (Bất kể IncludeDrafts ra sao)
                productsQuery = productsQuery.Where(p => p.Status == query.Status.Value);
            }
            else
            {
                // Ưu tiên 2: Nếu không chọn Status -> Mặc định ẩn Draft (trừ khi có cờ IncludeDrafts=true)
                if (!query.IncludeDrafts)
                    productsQuery = productsQuery.Where(p => p.Status != ProductStatus.Draft);
            }

            // -- Các bộ lọc khác
            if (query.CategoryId.HasValue)
                productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId.Value);

            if (query.ExcludeId.HasValue)
                productsQuery = productsQuery.Where(p => p.Id != query.ExcludeId.Value);

            // 5. Phân trang & Map về DTO
            var paginatedProducts = await productsQuery
                .OrderBy(p => p.Name) // Sắp xếp mặc định theo tên
                .ToPaginatedListAsync<Product, ProductDto>(query.PageNumber, query.PageSize, cancellationToken);

            // 6. Lưu vào Cache
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10)); // Cache tồn tại 10 phút

            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(paginatedProducts), cacheOptions, cancellationToken);

            return new GetProductsResult(paginatedProducts);
        }

        // Helper: Tạo key cache duy nhất dựa trên tham số truyền vào
        private string GenerateCacheKeyFromQuery(GetProductsQuery query)
        {
            return $"{query.PageNumber}:{query.PageSize}:" +
                   $"{(query.CategoryId.HasValue ? query.CategoryId.ToString() : "all")}:" +
                   $"{(string.IsNullOrWhiteSpace(query.Keyword) ? "nokey" : query.Keyword.Trim().ToLower())}:" +
                   $"{(query.ExcludeId.HasValue ? query.ExcludeId.ToString() : "noex")}:" +
                   $"{(query.IncludeDrafts ? "w_draft" : "no_draft")}:" +
                   $"{(query.Status.HasValue ? query.Status.ToString() : "any_status")}"; // Quan trọng: Thêm status vào key
        }
    }
}