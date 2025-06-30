using System;

namespace FinanceAPI.DTOs
{
    public class PersonTransactionDto
    {
        public long Id { get; set; }
        public int SourceUserId { get; set; }
        public int DestinationUserId { get; set; }
        public DateTime? StartDate { get; set; } // Now nullable
        public string? Currency { get; set; }
        public decimal Amount { get; set; }
        public string? Purpose { get; set; } // Added
        public DateTime? ScheduledEndDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }
        public string? SourceShortName { get; set; } // Added
        public string? DestinationShortName { get; set; } // Added

    }
}
