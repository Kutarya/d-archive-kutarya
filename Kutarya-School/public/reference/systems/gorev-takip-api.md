---
title: "Doğrulamalı görev takip REST API"
type: "system-guide"
canonical: "https://kutarya.com/sistemler/gorev-takip-api"
publisher: "Kutarya"
language: "tr-TR"
category: "Backend"
---

# Doğrulamalı görev takip REST API

ASP.NET Core ile veri modeli, doğrulama, HTTP sonuçları ve bütünleşme testi olan küçük ama üretim mantığı taşıyan API.

**Kategori:** Backend
**Teknoloji yığını:** C#, ASP.NET Core, xUnit
**Seviye:** Orta
**Okuma süresi:** 24 dk

## Sonuç

Görev oluşturma, listeleme ve tamamlama uçları; geçersiz isteklerde açık 400 yanıtı ve tekrarlanabilir test.

## Ön koşullar

- .NET 8 SDK
- HTTP ve JSON temeli
- Terminal veya Visual Studio

## Dosya ağacı

```text
TaskApi/
  Program.cs
  TaskItem.cs
TaskApi.Tests/
  TaskApiTests.cs
```

## Kurulum

dotnet new web -n TaskApi
dotnet new xunit -n TaskApi.Tests
dotnet add TaskApi.Tests reference TaskApi
dotnet add TaskApi.Tests package Microsoft.AspNetCore.Mvc.Testing
dotnet test
dotnet run --project TaskApi

## TaskApi/TaskItem.cs

API sözleşmesi ve iç model ayrıdır. İstek yalnız kullanıcıdan alınabilecek alanları içerir.


```csharp
public sealed record CreateTaskRequest(string Title);

public sealed class TaskItem
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string Title { get; init; }
    public bool Completed { get; set; }
}
```

## TaskApi/Program.cs

Uç noktalar doğrulama, bulunamadı ve başarılı cevaplarını birbirinden ayırır. ConcurrentDictionary örneği veritabanı eklenmeden davranışı çalıştırır.


```csharp
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var tasks = new ConcurrentDictionary<Guid, TaskItem>();

app.MapGet("/tasks", () => Results.Ok(tasks.Values));

app.MapPost("/tasks", (CreateTaskRequest request) =>
{
    var title = request.Title?.Trim();
    if (string.IsNullOrWhiteSpace(title) || title.Length > 120)
        return Results.ValidationProblem(new Dictionary<string, string[]>
        { ["title"] = ["Başlık 1-120 karakter olmalı."] });

    var item = new TaskItem { Title = title };
    tasks[item.Id] = item;
    return Results.Created($"/tasks/{item.Id}", item);
});

app.MapPatch("/tasks/{id:guid}/complete", (Guid id) =>
{
    if (!tasks.TryGetValue(id, out var item))
        return Results.NotFound();

    item.Completed = true;
    return Results.Ok(item);
});

app.Run();
public partial class Program { }
```

## TaskApi.Tests/TaskApiTests.cs

Gerçek test sunucusu üzerinden boş başlığın doğrulama cevabını ve geçerli isteğin 201 sonucunu kanıtlar.


```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

public sealed class TaskApiTests
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public TaskApiTests(WebApplicationFactory<Program> factory)
        => client = factory.CreateClient();

    [Fact]
    public async Task Empty_title_is_rejected()
    {
        var response = await client.PostAsJsonAsync(
            "/tasks", new CreateTaskRequest("  "));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Valid_task_is_created()
    {
        var response = await client.PostAsJsonAsync(
            "/tasks", new CreateTaskRequest("Dokümantasyonu yaz"));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
    }
}
```

## Çalışma kontrolleri

1. POST /tasks boş başlıkta 400 dönmeli
2. Geçerli görev 201 ve Location başlığı dönmeli
3. Olmayan kimlik için PATCH 404 dönmeli
4. dotnet test temiz ortamda geçmeli

## Hata ayıklama tablosu

| Belirti | Olası neden | Kontrol | Düzeltme |
| --- | --- | --- | --- |
| Address already in use | Aynı portta başka süreç çalışıyor. | dotnet run çıktısındaki adresi ve netstat sonucunu karşılaştır. | ASPNETCORE_URLS ile boş port seç veya eski süreci kapat. |
| 415 Unsupported Media Type | JSON gövdesi yanlış Content-Type ile gönderildi. | İstek başlıklarını incele. | Content-Type: application/json gönder. |
| Test 404 dönüyor | Test sunucusunun route veya base address değeri yanlış. | Test çıktısındaki istek yolunu yazdır. | WebApplicationFactory ve mutlak olmayan /tasks yolunu kullan. |

## Genişletme noktaları

- EF Core ve PostgreSQL kalıcılığı
- JWT yerine önce güvenli cookie oturumu
- ETag ile eşzamanlı güncelleme kontrolü
- OpenTelemetry günlük ve metrikleri

---
Canonical: https://kutarya.com/sistemler/gorev-takip-api
