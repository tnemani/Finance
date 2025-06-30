using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Backup
{
    [Key]
    public int Id { get; set; }

    public int BudgetId { get; set; }

    public int Multiplier { get; set; }

    [StringLength(100)]
    public string? Description { get; set; }

    [ForeignKey("BudgetId")]
    [InverseProperty("Backups")]
    public virtual Budget Budget { get; set; } = null!;
}
