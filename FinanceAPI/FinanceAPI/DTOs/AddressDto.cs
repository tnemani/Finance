using System.ComponentModel.DataAnnotations;

namespace FinanceAPI.DTOs;

public class AddressDto
{
    public int Id { get; set; }
    public string? AddressType { get; set; }
    public string? HouseNo { get; set; }
    public string? Line1 { get; set; }
    public string? Line2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? Zip { get; set; }
    public string? Description { get; set; }
    public string? ShortName { get; set; }
}
