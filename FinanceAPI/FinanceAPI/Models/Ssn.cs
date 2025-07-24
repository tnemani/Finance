using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceAPI.Models
{
    [Table("SSN")]
    public partial class SSN
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [StringLength(10)]
        [Column(TypeName = "nchar(10)")]
        public string? Currency { get; set; }

        [Column(TypeName = "decimal(18, 0)")]
        public decimal? MonthlyAfter62 { get; set; }

        [Column(TypeName = "decimal(18, 0)")]
        public decimal? MonthlyAfter67 { get; set; }

        [Column(TypeName = "decimal(18, 0)")]
        public decimal? MonthlyAfter70 { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? LastUpdatedDate { get; set; }

        [StringLength(100)]
        [Column(TypeName = "nchar(100)")]
        public string? Description { get; set; }

        [ForeignKey("UserId")]
        [InverseProperty("SSNs")]
        public virtual User? User { get; set; }
    }
}