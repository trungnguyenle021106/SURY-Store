using Mapster;
using Catalog.Application.CQRS.Products.Commands.CreateProduct; 
using Catalog.Domain.Entities; 

namespace Catalog.Application.Common.Mapping
{
    public class ProductMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<CreateProductCommand, Product>()
                  .MapToConstructor(true);
        }
    }
}