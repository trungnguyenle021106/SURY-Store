# Catalog.API/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy file csproj của Service và các BuildingBlocks
COPY ["Services/Catalog/Catalog.API/Catalog.API.csproj", "Services/Catalog/Catalog.API/"]
COPY ["BuildingBlocks/BuildingBlocks.Core/BuildingBlocks.Core.csproj", "BuildingBlocks/BuildingBlocks.Core/"]
COPY ["BuildingBlocks/BuildingBlocks.Application/BuildingBlocks.Application.csproj", "BuildingBlocks/BuildingBlocks.Application/"]
COPY ["BuildingBlocks/BuildingBlocks.Infrastructure/BuildingBlocks.Infrastructure.csproj", "BuildingBlocks/BuildingBlocks.Infrastructure/"]

# 2. Restore
RUN dotnet restore "Services/Catalog/Catalog.API/Catalog.API.csproj"

# 3. Copy toàn bộ code và Build
COPY . .
WORKDIR "/src/Services/Catalog/Catalog.API"
RUN dotnet build -c Release -o /app/build

# 4. Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# 5. Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Catalog.API.dll"]