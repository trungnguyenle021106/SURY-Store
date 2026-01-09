
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Services/Basket/Basket.API/Basket.API.csproj", "Services/Basket/Basket.API/"]

COPY ["BuildingBlocks/BuildingBlocks.Core/BuildingBlocks.Core.csproj", "BuildingBlocks/BuildingBlocks.Core/"]
COPY ["BuildingBlocks/BuildingBlocks.Application/BuildingBlocks.Application.csproj", "BuildingBlocks/BuildingBlocks.Application/"]
COPY ["BuildingBlocks/BuildingBlocks.Infrastructure/BuildingBlocks.Infrastructure.csproj", "BuildingBlocks/BuildingBlocks.Infrastructure/"]


# --- RESTORE & BUILD ---
RUN dotnet restore "Services/Basket/Basket.API/Basket.API.csproj"

# Copy toàn bộ source code còn lại
COPY . .

# Build Service
WORKDIR "/src/Services/Basket/Basket.API"
RUN dotnet build -c Release -o /app/build

# --- PUBLISH ---
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# 2. Giai đoạn Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Basket.API.dll"]