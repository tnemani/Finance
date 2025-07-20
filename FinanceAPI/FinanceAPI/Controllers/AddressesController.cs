using Microsoft.AspNetCore.Mvc;
using FinanceAPI.Models;
using FinanceAPI.DTOs;
using FinanceAPI.Data;

[ApiController]
[Route("api/[controller]")]
public class AddressesController : ControllerBase
{
    private readonly FinanceDbContext _context;
    public AddressesController(FinanceDbContext context) => _context = context;

    [HttpGet]
    public ActionResult<IEnumerable<AddressDto>> GetAddresses()
    {
        var addresses = _context.Addresses.ToList()
            .Select(a => new AddressDto
            {
                Id = a.Id,
                AddressType = a.AddressType?.Trim(),
                HouseNo = a.HouseNo?.Trim(),
                Line1 = a.Line1?.Trim(),
                Line2 = a.Line2?.Trim(),
                City = a.City?.Trim(),
                State = a.State?.Trim(),
                Country = a.Country?.Trim(),
                Zip = a.Zip?.Trim(),
                Description = a.Description?.Trim(),
                ShortName = a.ShortName?.Trim()
            }).ToList();
        return addresses;
    }

    [HttpGet("{id}")]
    public ActionResult<AddressDto> GetAddress(int id)
    {
        var a = _context.Addresses.Find(id);
        if (a == null) return NotFound();
        return new AddressDto
        {
            Id = a.Id,
            AddressType = a.AddressType?.Trim(),
            HouseNo = a.HouseNo?.Trim(),
            Line1 = a.Line1?.Trim(),
            Line2 = a.Line2?.Trim(),
            City = a.City?.Trim(),
            State = a.State?.Trim(),
            Country = a.Country?.Trim(),
            Zip = a.Zip?.Trim(),
            Description = a.Description?.Trim(),
            ShortName = a.ShortName?.Trim()
        };
    }

    [HttpPost]
    public ActionResult<AddressDto> PostAddress(AddressDto dto)
    {
        var address = new Address
        {
            AddressType = dto.AddressType?.Trim(),
            HouseNo = dto.HouseNo?.Trim(),
            Line1 = dto.Line1?.Trim(),
            Line2 = dto.Line2?.Trim(),
            City = dto.City?.Trim(),
            State = dto.State?.Trim(),
            Country = dto.Country?.Trim(),
            Zip = dto.Zip?.Trim(),
            Description = dto.Description?.Trim()
        };
        _context.Addresses.Add(address);
        _context.SaveChanges();
        dto.Id = address.Id;
        return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult PutAddress(int id, AddressDto dto)
    {
        var address = _context.Addresses.Find(id);
        if (address == null) return NotFound();
        address.AddressType = dto.AddressType?.Trim();
        address.HouseNo = dto.HouseNo?.Trim();
        address.Line1 = dto.Line1?.Trim();
        address.Line2 = dto.Line2?.Trim();
        address.City = dto.City?.Trim();
        address.State = dto.State?.Trim();
        address.Country = dto.Country?.Trim();
        address.Zip = dto.Zip?.Trim();
        address.Description = dto.Description?.Trim();
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteAddress(int id)
    {
        var address = _context.Addresses.Find(id);
        if (address == null) return NotFound();
        _context.Addresses.Remove(address);
        _context.SaveChanges();
        return NoContent();
    }

    [HttpGet("user/{userId}")]
    public ActionResult<IEnumerable<AddressDto>> GetAddressesForUser(int userId)
    {
        var addresses = _context.UserAddresses
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.Address)
            .Where(a => a != null)
            .ToList()
            .Select(a => new AddressDto
            {
                Id = a!.Id,
                AddressType = a!.AddressType?.Trim(),
                HouseNo = a!.HouseNo?.Trim(),
                Line1 = a!.Line1?.Trim(),
                Line2 = a!.Line2?.Trim(),
                City = a!.City?.Trim(),
                State = a!.State?.Trim(),
                Country = a!.Country?.Trim(),
                Zip = a!.Zip?.Trim(),
                Description = a!.Description?.Trim()
            }).ToList();
        return addresses;
    }
}
