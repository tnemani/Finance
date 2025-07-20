using System;

namespace FinanceAPI.DTOs
{
    public class JewleryDto
    {
        public int Id { get; set; }
        public int Owner { get; set; }
        private string? _type;
        public string? Type { get => _type?.Trim(); set => _type = value; }
        private string? _name;
        public string? Name { get => _name?.Trim(); set => _name = value; }
        public decimal? Weight { get; set; }
        private string? _weightUnits;
        public string? WeightUnits { get => _weightUnits?.Trim(); set => _weightUnits = value; }
        public decimal? PurchasedPrice { get; set; }
        private string? _currency;
        public string? Currency { get => _currency?.Trim(); set => _currency = value; }
        public DateTime? PurchasedDate { get; set; }
        public int? PurchasedFrom { get; set; }
        private string? _description;
        public string? Description { get => _description?.Trim(); set => _description = value; }
    }
}
