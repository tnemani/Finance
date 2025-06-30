namespace FinanceAPI.DTOs;

public class UserAddressWithAddressDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int? AddressId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? AddressType { get; set; }
    public string? HouseNo { get; set; }
    public string? Line1 { get; set; }
    public string? Line2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? Zip { get; set; }
    public string? Description { get; set; }
}
