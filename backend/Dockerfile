FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Helpdesk.Api/Helpdesk.Api.csproj Helpdesk.Api/
RUN dotnet restore Helpdesk.Api/Helpdesk.Api.csproj

COPY . .
RUN dotnet publish Helpdesk.Api/Helpdesk.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Helpdesk.Api.dll"]
