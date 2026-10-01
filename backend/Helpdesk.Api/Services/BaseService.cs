using Helpdesk.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Api.Services;

public class BaseService<TEntity>(AppDbContext db) where TEntity : class
{
    protected AppDbContext Db { get; } = db;
    protected DbSet<TEntity> Set => Db.Set<TEntity>();

    public virtual async Task<IReadOnlyList<TEntity>> GetAllAsync() =>
        await Set.AsNoTracking().ToListAsync();

    public virtual async Task<TEntity> GetByIdAsync(Guid id) =>
        await Set.FindAsync(id)
        ?? throw new KeyNotFoundException($"{typeof(TEntity).Name} with id '{id}' was not found.");

    public virtual async Task<TEntity> AddAsync(TEntity entity)
    {
        Set.Add(entity);
        await Db.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<TEntity> UpdateAsync(TEntity entity)
    {
        Set.Update(entity);
        await Db.SaveChangesAsync();
        return entity;
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        Set.Remove(await GetByIdAsync(id));
        await Db.SaveChangesAsync();
    }
}
