namespace FinanceAPI.DTOs;

public class UserAddressDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int? AddressId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
