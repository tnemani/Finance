using System;

namespace FinanceAPI.DTOs
{
    public class InvestmentDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        private string? _userShortName;
        public string? UserShortName { get => _userShortName?.Trim(); set => _userShortName = value; }
        private string? _type;
        public string? Type { get => _type?.Trim(); set => _type = value; }
        public decimal? Qty { get; set; }
        private string? _symbol;
        public string? Symbol { get => _symbol?.Trim(); set => _symbol = value; }
        private string? _currency;
        public string? Currency { get => _currency?.Trim(); set => _currency = value; }
        public DateTime? StartDate { get; set; }
        private string? _policyNo;
        public string? PolicyNo { get => _policyNo?.Trim(); set => _policyNo = value; }
        private string? _financialnstitution;
        public string? Financialnstitution { get => _financialnstitution?.Trim(); set => _financialnstitution = value; }
        private string? _description;
        public string? Description { get => _description?.Trim(); set => _description = value; }

    }
}
