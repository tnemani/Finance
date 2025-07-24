using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceAPI.Models
{
    [Table("FourOOneK")]
    public partial class FourOOneK
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [StringLength(50)]
        [Column(TypeName = "nchar(50)")]
        public string? AssetClass { get; set; }

        [StringLength(20)]
        [Column(TypeName = "nchar(20)")]
        public string? PolicyNo { get; set; }

        [StringLength(20)]
        [Column(TypeName = "nchar(20)")]
        public string? Term { get; set; }

        [StringLength(10)]
        [Column(TypeName = "nchar(10)")]
        public string? Currency { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? StartDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? MaturityDate { get; set; }

        [Column(TypeName = "decimal(18, 0)")]
        public decimal? InvestmentAmount { get; set; }

        [Column(TypeName = "decimal(18, 0)")]
        public decimal? CurrentAmount { get; set; }

        [StringLength(100)]
        [Column(TypeName = "nchar(100)")]
        public string? Description { get; set; }

        [ForeignKey("UserId")]
        [InverseProperty("FourOOneKs")]
        public virtual User? User { get; set; }
    }
}