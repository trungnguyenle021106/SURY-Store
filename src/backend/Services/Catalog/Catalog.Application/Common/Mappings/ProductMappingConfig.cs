using Catalog.Application.CQRS.Products.Commands.CreateBatchProducts;
using Catalog.Application.CQRS.Products.Commands.CreateProduct; 
using Catalog.Domain.Entities; 
using Mapster;

namespace Catalog.Application.Common.Mapping
{
    public class ProductMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<CreateProductCommand, Product>()
                  .MapToConstructor(true);
            config.NewConfig<CreateBatchProductDto, Product>()
                  .MapToConstructor(true);
        }
    }
}