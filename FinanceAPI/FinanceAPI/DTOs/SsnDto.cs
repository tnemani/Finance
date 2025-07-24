using System;
using System.ComponentModel.DataAnnotations;

namespace FinanceAPI.DTOs
{
    public class SSNDto
    {
        public int Id { get; set; }

        public int? UserId { get; set; }

        public string? UserShortName { get; set; }

        [StringLength(10)]
        public string? Currency { get; set; }

        public decimal? MonthlyAfter62 { get; set; }

        public decimal? MonthlyAfter67 { get; set; }

        public decimal? MonthlyAfter70 { get; set; }

        public DateTime? LastUpdatedDate { get; set; }

        [StringLength(100)]
        public string? Description { get; set; }
    }
}