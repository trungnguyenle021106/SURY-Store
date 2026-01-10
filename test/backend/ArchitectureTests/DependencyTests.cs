using NetArchTest.Rules;
using Xunit;
using System.Reflection;

namespace ArchitectureTests;

public class DependencyTests
{
    public static IEnumerable<object[]> GetServiceAssemblies()
    {
        yield return new object[]
        {
            "Catalog",
            typeof(Catalog.Domain.AssemblyReference).Assembly,
            typeof(Catalog.Application.AssemblyReference).Assembly,
            typeof(Catalog.Infrastructure.AssemblyReference).Assembly
        };

        yield return new object[]
        {
            "Basket",
            typeof(Basket.Domain.AssemblyReference).Assembly,
            typeof(Basket.Application.AssemblyReference).Assembly,
            typeof(Basket.Infrastructure.AssemblyReference).Assembly
        };

        yield return new object[]
        {
            "Identity",
            typeof(Identity.Domain.AssemblyReference).Assembly,
            typeof(Identity.Application.AssemblyReference).Assembly,
            typeof(Identity.Infrastructure.AssemblyReference).Assembly
        };

        yield return new object[]
        {
            "Ordering",
            typeof(Ordering.Domain.AssemblyReference).Assembly,
            typeof(Ordering.Application.AssemblyReference).Assembly,
            typeof(Ordering.Infrastructure.AssemblyReference).Assembly
        };
    }

    [Theory]
    [MemberData(nameof(GetServiceAssemblies))]
    public void Domain_Should_Not_Have_Dependency_On_Other_Projects(string serviceName, Assembly domain, Assembly app, Assembly infra)
    {
        var result = Types.InAssembly(domain)
            .ShouldNot()
            .HaveDependencyOnAll(
                $"{serviceName}.Application",
                $"{serviceName}.Infrastructure",
                $"{serviceName}.API")
            .GetResult();

        Assert.True(result.IsSuccessful, $"[Lỗi {serviceName}]: Domain layer không được tham chiếu đến các tầng khác.");
    }

    [Theory]
    [MemberData(nameof(GetServiceAssemblies))]
    public void Application_Should_Only_Depend_On_Domain(string serviceName, Assembly domain, Assembly app, Assembly infra)
    {
        var result = Types.InAssembly(app)
            .ShouldNot()
            .HaveDependencyOnAll(
                $"{serviceName}.Infrastructure",
                $"{serviceName}.API")
            .GetResult();

        Assert.True(result.IsSuccessful, $"[Lỗi {serviceName}]: Application layer không được tham chiếu tới Infrastructure hoặc API.");
    }

    [Theory]
    [MemberData(nameof(GetServiceAssemblies))]
    public void Infrastructure_Should_Not_Have_Dependency_On_API(string serviceName, Assembly domain, Assembly app, Assembly infra)
    {
        var result = Types.InAssembly(infra)
            .ShouldNot()
            .HaveDependencyOnAny($"{serviceName}.API") 
            .GetResult();

        Assert.True(result.IsSuccessful, $"[Lỗi {serviceName}]: Infrastructure không được tham chiếu tới API.");
    }
}