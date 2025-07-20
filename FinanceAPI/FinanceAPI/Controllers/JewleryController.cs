using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceAPI.Models;
using FinanceAPI.Data;
using FinanceAPI.DTOs;

namespace FinanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JewleryController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public JewleryController(FinanceDbContext context) => _context = context;

        // GET: api/Jewlery
        [HttpGet]
        public async Task<IActionResult> GetJewlery()
        {
            var items = await _context.Jewleries
                .Select(j => new JewleryDto {
                    Id = j.Id,
                    Owner = j.Owner,
                    Type = j.Type != null ? j.Type.Trim() : null,
                    Name = j.Name != null ? j.Name.Trim() : null,
                    Weight = j.Weight,
                    WeightUnits = j.WeightUnits != null ? j.WeightUnits.Trim() : null,
                    PurchasedPrice = j.PurchasedPrice,
                    Currency = j.Currency != null ? j.Currency.Trim() : null,
                    PurchasedDate = j.PurchasedDate != null ? new DateTime(j.PurchasedDate.Value.Year, j.PurchasedDate.Value.Month, j.PurchasedDate.Value.Day) : (DateTime?)null,
                    PurchasedFrom = j.PurchasedFrom,
                    Description = j.Description != null ? j.Description.Trim() : null
                })
                .ToListAsync();
            return Ok(items);
        }

        // GET: api/Jewlery/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetJewlery(int id)
        {
            var j = await _context.Jewleries.FindAsync(id);
            if (j == null) return NotFound();
            var dto = new JewleryDto {
                Id = j.Id,
                Owner = j.Owner,
                Type = j.Type != null ? j.Type.Trim() : null,
                Name = j.Name != null ? j.Name.Trim() : null,
                Weight = j.Weight,
                WeightUnits = j.WeightUnits != null ? j.WeightUnits.Trim() : null,
                PurchasedPrice = j.PurchasedPrice,
                Currency = j.Currency != null ? j.Currency.Trim() : null,
                PurchasedDate = j.PurchasedDate != null ? new DateTime(j.PurchasedDate.Value.Year, j.PurchasedDate.Value.Month, j.PurchasedDate.Value.Day) : (DateTime?)null,
                PurchasedFrom = j.PurchasedFrom,
                Description = j.Description != null ? j.Description.Trim() : null
            };
            return Ok(dto);
        }

        // POST: api/Jewlery
        [HttpPost]
        public async Task<IActionResult> CreateJewlery([FromBody] JewleryDto dto)
        {
            var j = new Jewlery {
                Owner = dto.Owner,
                Type = dto.Type?.Trim(),
                Name = dto.Name?.Trim(),
                Weight = dto.Weight,
                WeightUnits = dto.WeightUnits?.Trim(),
                PurchasedPrice = dto.PurchasedPrice,
                Currency = dto.Currency?.Trim(),
                PurchasedDate = dto.PurchasedDate != null ? DateOnly.FromDateTime(dto.PurchasedDate.Value) : (DateOnly?)null,
                PurchasedFrom = dto.PurchasedFrom,
                Description = dto.Description?.Trim()
            };
            _context.Jewleries.Add(j);
            await _context.SaveChangesAsync();
            dto.Id = j.Id;
            return CreatedAtAction(nameof(GetJewlery), new { id = j.Id }, dto);
        }

        // PUT: api/Jewlery/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJewlery(int id, [FromBody] JewleryDto dto)
        {
            var j = await _context.Jewleries.FindAsync(id);
            if (j == null) return NotFound();
            j.Owner = dto.Owner;
            j.Type = dto.Type?.Trim();
            j.Name = dto.Name?.Trim();
            j.Weight = dto.Weight;
            j.WeightUnits = dto.WeightUnits?.Trim();
            j.PurchasedPrice = dto.PurchasedPrice;
            j.Currency = dto.Currency?.Trim();
            j.PurchasedDate = dto.PurchasedDate != null ? DateOnly.FromDateTime(dto.PurchasedDate.Value) : (DateOnly?)null;
            j.PurchasedFrom = dto.PurchasedFrom;
            j.Description = dto.Description?.Trim();
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Jewlery/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJewlery(int id)
        {
            var j = await _context.Jewleries.FindAsync(id);
            if (j == null) return NotFound();
            _context.Jewleries.Remove(j);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
