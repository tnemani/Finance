using System;

namespace FinanceAPI.DTOs
{
    public class InvestmentDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserShortName { get; set; }
        public string? Type { get; set; }
        public decimal? Qty { get; set; }
        public string? Symbol { get; set; }
        public string? Currency { get; set; }
        public DateTime? StartDate { get; set; }
        public string? PolicyNo { get; set; }
        public string? Financialnstitution { get; set; }
        public string? Description { get; set; }
        public decimal? CurrentValue { get; set; }
    }
}
