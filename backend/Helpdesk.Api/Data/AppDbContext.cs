using Helpdesk.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketLabel> TicketLabels => Set<TicketLabel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.ToTable("Tickets");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Id).ValueGeneratedNever();

            entity.Property(t => t.Title).IsRequired().HasMaxLength(100);
            entity.Property(t => t.Description).HasMaxLength(2000);
            entity.Property(t => t.UserEmail).IsRequired().HasMaxLength(254);

            entity.Property(t => t.Category).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20);

            entity.HasIndex(t => t.Status);
            entity.HasIndex(t => t.Priority);
            entity.HasIndex(t => t.CreatedAt);
        });

        modelBuilder.Entity<TicketLabel>(entity =>
        {
            entity.ToTable("TicketLabels");
            entity.HasKey(l => new { l.Group, l.Value });

            entity.Property(l => l.Group).HasConversion<string>().HasMaxLength(20);
            entity.Property(l => l.Value).HasMaxLength(20);
            entity.Property(l => l.Label).IsRequired().HasMaxLength(100);
        });
    }
}
