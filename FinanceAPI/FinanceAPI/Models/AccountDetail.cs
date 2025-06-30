using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class AccountDetail
{
    [Key]
    public int Id { get; set; }

    public int? UserId { get; set; }

    [StringLength(500)]
    public string? Website { get; set; }

    [StringLength(50)]
    public string? LoginId { get; set; }

    [StringLength(50)]
    public string? Password { get; set; }

    [StringLength(50)]
    public string? Email { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AccountDetails")]
    public virtual User? User { get; set; }
}
