using Helpdesk.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        if (await db.Tickets.AnyAsync()) return;

        var now = DateTime.UtcNow;

        Ticket T(string title, string? description, string email, TicketCategory category,
                 TicketStatus status, TicketPriority priority, int daysAgo) => new()
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = description,
            UserEmail = email,
            Category = category,
            Status = status,
            Priority = priority,
            CreatedAt = now.AddDays(-daysAgo),
            UpdatedAt = now.AddDays(-daysAgo)
        };

        db.Tickets.AddRange(
            T("Не включается ноутбук", "После обновления BIOS ноутбук не загружается, индикатор питания мигает.",
                "ivanov@company.kz", TicketCategory.Hardware, TicketStatus.New, TicketPriority.High, 1),
            T("Установить Visual Studio 2022", "Нужна лицензия Professional для новой разработки.",
                "petrov@company.kz", TicketCategory.Software, TicketStatus.InProgress, TicketPriority.Medium, 2),
            T("Нет доступа к общей папке бухгалтерии", null,
                "sidorova@company.kz", TicketCategory.Access, TicketStatus.New, TicketPriority.Medium, 2),
            T("Медленный Wi-Fi в переговорной 3", "Скорость падает до 1 Мбит/с при видеозвонках.",
                "kim@company.kz", TicketCategory.Network, TicketStatus.InProgress, TicketPriority.High, 3),
            T("Заменить мышь и клавиатуру", "Клавиатура залита, залипают клавиши.",
                "akhmetov@company.kz", TicketCategory.Hardware, TicketStatus.Resolved, TicketPriority.Low, 5),
            T("VPN не подключается из дома", "Ошибка 809 при подключении.",
                "nurlan@company.kz", TicketCategory.Network, TicketStatus.Resolved, TicketPriority.High, 6),
            T("Сервер 1С недоступен", "Все пользователи бухгалтерии не могут открыть базу.",
                "buh@company.kz", TicketCategory.Software, TicketStatus.Resolved, TicketPriority.Critical, 7),
            T("Создать учётную запись для нового сотрудника", "Выход на работу в понедельник, отдел продаж.",
                "hr@company.kz", TicketCategory.Access, TicketStatus.Closed, TicketPriority.Medium, 8),
            T("Принтер на 2 этаже печатает полосами", null,
                "office@company.kz", TicketCategory.Hardware, TicketStatus.Closed, TicketPriority.Low, 10),
            T("Не приходит почта от внешних адресов", "Письма от клиентов попадают в спам или не доходят.",
                "sales@company.kz", TicketCategory.Software, TicketStatus.InProgress, TicketPriority.Critical, 1),
            T("Настроить второй монитор", "Монитор не определяется через док-станцию.",
                "dev1@company.kz", TicketCategory.Hardware, TicketStatus.New, TicketPriority.Low, 0),
            T("Сбросить пароль от учётной записи", "Забыл пароль после отпуска.",
                "marketing@company.kz", TicketCategory.Access, TicketStatus.Resolved, TicketPriority.Medium, 4),
            T("Обновить антивирус на рабочих станциях", "Требуется массовое обновление до последней версии.",
                "security@company.kz", TicketCategory.Software, TicketStatus.New, TicketPriority.High, 0),
            T("Проложить сетевой кабель в новый кабинет", "Кабинет 214, три рабочих места.",
                "admin@company.kz", TicketCategory.Network, TicketStatus.InProgress, TicketPriority.Medium, 9),
            T("Вопрос по использованию корпоративного портала", "Не могу найти форму заявки на отпуск.",
                "newbie@company.kz", TicketCategory.Other, TicketStatus.Closed, TicketPriority.Low, 12),
            T("Доступ к Jira для подрядчика", "Проект Migration, права только на чтение.",
                "pm@company.kz", TicketCategory.Access, TicketStatus.New, TicketPriority.Medium, 1)
        );

        await db.SaveChangesAsync();
    }
}
