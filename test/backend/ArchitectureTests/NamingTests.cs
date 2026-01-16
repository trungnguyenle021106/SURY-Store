using NetArchTest.Rules;
using MediatR;
using Carter;
using System.Reflection;

namespace ArchitectureTests;

public class NamingTests
{
    private static readonly Assembly[] ApplicationAssemblies =
    {
        typeof(Catalog.Application.AssemblyReference).Assembly,
        typeof(Basket.Application.AssemblyReference).Assembly,
        typeof(Identity.Application.AssemblyReference).Assembly,
        typeof(Ordering.Application.AssemblyReference).Assembly
    };

    private static readonly Assembly[] ApiAssemblies =
    {
        typeof(Catalog.API.AssemblyReference).Assembly,
        typeof(Basket.API.AssemblyReference).Assembly,
        typeof(Identity.API.AssemblyReference).Assembly,
        typeof(Ordering.API.AssemblyReference).Assembly
    };

    private static readonly Assembly[] AllAssemblies =
    {
        typeof(Catalog.Domain.AssemblyReference).Assembly,
        typeof(Catalog.Application.AssemblyReference).Assembly,
        typeof(Catalog.Infrastructure.AssemblyReference).Assembly,
        typeof(Catalog.API.AssemblyReference).Assembly,
    };

    private void AssertResult(TestResult result, string errorMessage)
    {
        if (result.IsSuccessful)
        {
            return;
        }

        var failingTypes = result.FailingTypes?.Select(t => t.Name).ToList() ?? new List<string>();

        var detailedError = $"{errorMessage}\n[DANH SÁCH FILE VI PHẠM]:\n - {string.Join("\n - ", failingTypes)}";

        Assert.Fail(detailedError);
    }

    [Fact]
    public void MediatR_Handlers_Should_Have_Handler_Suffix()
    {
        var result = Types.InAssemblies(ApplicationAssemblies)
            .That()
            .ImplementInterface(typeof(IRequestHandler<,>))
            .Should()
            .HaveNameEndingWith("Handler")
            .GetResult();

        AssertResult(result, "Lỗi: Có class Handler chưa đặt tên theo hậu tố 'Handler'.");
    }

    [Fact]
    public void CQRS_Classes_Should_Have_Correct_Suffix_And_Structure()
    {
        var result = Types.InAssemblies(ApplicationAssemblies)
            .That()
            .ResideInNamespaceContaining("CQRS")
            .And().AreClasses()
            .And().DoNotHaveName("AssemblyReference") 
            .Should()
            .HaveNameEndingWith("Command")
            .Or().HaveNameEndingWith("Query")
            .Or().HaveNameEndingWith("Handler")
            .Or().HaveNameEndingWith("Validator")
            .Or().HaveNameEndingWith("Dto")
            .Or().HaveNameEndingWith("Result")
            .GetResult();

        AssertResult(result, "Lỗi: Class trong folder CQRS phải kết thúc bằng Command, Query, Handler, Validator, Dto hoặc Result.");
    }

    [Fact]
    public void Validators_Should_Be_In_Correct_Namespace()
    {
        var result = Types.InAssemblies(ApplicationAssemblies)
            .That()
            .HaveNameEndingWith("Validator")
            .Should()
            .ResideInNamespaceContaining("Commands")
            .Or().ResideInNamespaceContaining("Queries")
            .GetResult();

        AssertResult(result, "Lỗi: Validator phải nằm đúng trong thư mục Commands hoặc Queries.");
    }

    [Fact]
    public void All_Interfaces_Should_Start_With_I()
    {
        var result = Types.InAssemblies(AllAssemblies)
            .That()
            .AreInterfaces()
            .Should()
            .HaveNameStartingWith("I")
            .GetResult();

        AssertResult(result, "Lỗi: Một số Interface chưa có tiền tố 'I'.");
    }

    [Fact]
    public void Carter_Modules_Should_Have_Endpoint_Suffix()
    {
        var result = Types.InAssemblies(ApiAssemblies)
            .That()
            .ImplementInterface(typeof(ICarterModule))
            .Should()
            .HaveNameEndingWith("Endpoint")
            .GetResult();

        AssertResult(result, "Lỗi: Các module Carter (Minimal API) phải kết thúc bằng 'Endpoint'.");
    }
}