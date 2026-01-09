# Gateways/OcelotGateway/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy file csproj của OcelotGateway
COPY ["Gateways/OcelotGateway/OcelotGateway.csproj", "Gateways/OcelotGateway/"]

# 2. Copy các BuildingBlocks (Để phòng trường hợp Gateway có reference dùng chung Log/Auth)
COPY ["BuildingBlocks/BuildingBlocks.Core/BuildingBlocks.Core.csproj", "BuildingBlocks/BuildingBlocks.Core/"]
COPY ["BuildingBlocks/BuildingBlocks.Application/BuildingBlocks.Application.csproj", "BuildingBlocks/BuildingBlocks.Application/"]
COPY ["BuildingBlocks/BuildingBlocks.Infrastructure/BuildingBlocks.Infrastructure.csproj", "BuildingBlocks/BuildingBlocks.Infrastructure/"]


# 3. Restore
RUN dotnet restore "Gateways/OcelotGateway/OcelotGateway.csproj"

# 4. Copy toàn bộ code và Build
COPY . .
WORKDIR "/src/Gateways/OcelotGateway"
RUN dotnet build -c Release -o /app/build

# 5. Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# 6. Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# QUAN TRỌNG: Đảm bảo file ocelot.json được copy theo (thường .csproj đã xử lý, nhưng check kỹ)
# Entrypoint chạy file dll
ENTRYPOINT ["dotnet", "OcelotGateway.dll"]