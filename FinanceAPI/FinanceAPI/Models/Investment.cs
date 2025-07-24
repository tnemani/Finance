using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Investment
{
    [Key]
    public int Id { get; set; }

    public int? UserId { get; set; }

    [StringLength(50)]
    public string? Type { get; set; }

    [Column(TypeName = "decimal(18, 6)")]
    public decimal? Qty { get; set; }

    [StringLength(20)]
    [Column(TypeName = "nchar(20)")]
    public string? Symbol { get; set; }

    [StringLength(10)]
    [Column(TypeName = "nchar(10)")]
    public string? Currency { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? StartDate { get; set; }

    [StringLength(50)]
    [Column(TypeName = "nchar(50)")]
    public string? PolicyNo { get; set; }

    [StringLength(50)]
    [Column(TypeName = "nchar(50)")]
    public string? Financialnstitution { get; set; }

    [StringLength(200)]
    [Column(TypeName = "nchar(200)")]
    public string? Description { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Investments")]
    public virtual User? User { get; set; }
}
