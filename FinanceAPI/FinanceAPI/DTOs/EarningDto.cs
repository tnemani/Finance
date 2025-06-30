namespace FinanceAPI.DTOs;

public class EarningDto
{
    public int Id { get; set; }
    public string? Type { get; set; }
    public string? Frequency { get; set; }
    public string? StartDate { get; set; }
    public int? Sender { get; set; }
    public int? Receiver { get; set; }
    public string? Item { get; set; }
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public string? EndDate { get; set; }
    public int OwnerId { get; set; }
    public string? LastUpdatedDate { get; set; }
    public string? Description { get; set; }
    public string? OwnerName { get; set; }
    public string? SenderName { get; set; }
    public string? ReceiverName { get; set; }
}
