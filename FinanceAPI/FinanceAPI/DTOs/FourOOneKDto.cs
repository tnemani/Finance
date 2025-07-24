using System;
using System.ComponentModel.DataAnnotations;

namespace FinanceAPI.DTOs
{
    public class FourOOneKDto
    {
        public int Id { get; set; }

        public int? UserId { get; set; }

        public string? UserShortName { get; set; }

        [StringLength(50)]
        public string? AssetClass { get; set; }

        [StringLength(20)]
        public string? PolicyNo { get; set; }

        [StringLength(20)]
        public string? Term { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? MaturityDate { get; set; }

        public decimal? InvestmentAmount { get; set; }

        public decimal? CurrentAmount { get; set; }

        [StringLength(100)]
        public string? Description { get; set; }
    }
}