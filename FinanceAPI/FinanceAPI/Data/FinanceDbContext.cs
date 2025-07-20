using System;
using System.Collections.Generic;
using FinanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Data;

public partial class FinanceDbContext : DbContext
{
    public FinanceDbContext()
    {
    }

    public FinanceDbContext(DbContextOptions<FinanceDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AccountDetail> AccountDetails { get; set; }

    public virtual DbSet<AccountDetailsKeyValue> AccountDetailsKeyValues { get; set; }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<Asset> Assets { get; set; }

    public virtual DbSet<Backup> Backups { get; set; }

    public virtual DbSet<Balance> Balances { get; set; }

    public virtual DbSet<Budget> Budgets { get; set; }

    public virtual DbSet<Earning> Earnings { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

    public virtual DbSet<Investment> Investments { get; set; }

    public virtual DbSet<Jewlery> Jewleries { get; set; }

    public virtual DbSet<Loan> Loans { get; set; }

    public virtual DbSet<PersonTransaction> PersonTransactions { get; set; }

    public virtual DbSet<Setting> Settings { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAddress> UserAddresses { get; set; }

protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.UseSqlServer("Name=FinanceDb");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AccountDetail>(entity =>
        {
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.Email).IsFixedLength();
            entity.Property(e => e.LoginId).IsFixedLength();
            entity.Property(e => e.Password)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Phone).IsFixedLength();
            entity.Property(e => e.Website).IsFixedLength();

            entity.HasOne(d => d.User).WithMany(p => p.AccountDetails).HasConstraintName("FK_AccountDetails_Users");
        });

        modelBuilder.Entity<AccountDetailsKeyValue>(entity =>
        {
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.KeyName)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Value)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
        });

        modelBuilder.Entity<Address>(entity =>
        {
            entity.Property(e => e.AddressType).IsFixedLength();
            entity.Property(e => e.City).IsFixedLength();
            entity.Property(e => e.Country).IsFixedLength();
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.HouseNo).IsFixedLength();
            entity.Property(e => e.Line1).IsFixedLength();
            entity.Property(e => e.Line2).IsFixedLength();
            entity.Property(e => e.State).IsFixedLength();
            entity.Property(e => e.Zip).IsFixedLength();
        });

        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Asets");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<Backup>(entity =>
        {
            entity.Property(e => e.Description).IsFixedLength();

            entity.HasOne(d => d.Budget).WithMany(p => p.Backups)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Backups_Budget");
        });

        modelBuilder.Entity<Balance>(entity =>
        {
            entity.Property(e => e.BankName).IsFixedLength();
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Remarks).IsFixedLength();
            entity.Property(e => e.Type).IsFixedLength();
        });

        modelBuilder.Entity<Budget>(entity =>
        {
            entity.Property(e => e.Category).IsFixedLength();
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.Frequency).IsFixedLength();
            entity.Property(e => e.Purpose).IsFixedLength();
            entity.Property(e => e.Severity).IsFixedLength();
        });

        modelBuilder.Entity<Earning>(entity =>
        {
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.Frequency).IsFixedLength();
            entity.Property(e => e.Item).IsFixedLength();
            entity.Property(e => e.Type).IsFixedLength();

            entity.HasOne(d => d.Owner).WithMany(p => p.EarningOwners)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Earnings_Users");

            entity.HasOne(d => d.ReceiverNavigation).WithMany(p => p.EarningReceiverNavigations).HasConstraintName("FK_Earnings_Users2");

            entity.HasOne(d => d.SenderNavigation).WithMany(p => p.EarningSenderNavigations).HasConstraintName("FK_Earnings_Users1");
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.AvoidReason).ValueGeneratedOnAdd();
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Purpose).IsFixedLength();
            entity.Property(e => e.Status).IsFixedLength();
        });

        modelBuilder.Entity<Investment>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.PolicyNo).IsFixedLength();
            entity.Property(e => e.Symbol).IsFixedLength();
            entity.Property(e => e.Type).IsFixedLength();

            entity.HasOne(d => d.User).WithMany(p => p.Investments).HasConstraintName("FK_Investments_Users");
        });

        modelBuilder.Entity<Jewlery>(entity =>
        {
            entity.Property(e => e.Type).IsFixedLength();
            entity.Property(e => e.Name).IsFixedLength();
            entity.Property(e => e.WeightUnits).IsFixedLength();
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Description).IsFixedLength();
        });

        modelBuilder.Entity<Loan>(entity =>
        {
            entity.Property(e => e.Description).IsFixedLength();

            entity.HasOne(d => d.Asset).WithMany(p => p.Loans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Loans_Assets");
        });

        modelBuilder.Entity<PersonTransaction>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Currency).IsFixedLength();
            entity.Property(e => e.Reason).IsFixedLength();
            entity.Property(e => e.Status).IsFixedLength();

            entity.HasOne(d => d.DestinationUser).WithMany(p => p.PersonTransactionDestinationUsers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PersonTransactions_Users1");

            entity.HasOne(d => d.SourceUser).WithMany(p => p.PersonTransactionSourceUsers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PersonTransactions_Users");
        });

        modelBuilder.Entity<Setting>(entity =>
        {
            entity.Property(e => e.KeyName)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Notes).IsFixedLength();
            entity.Property(e => e.Units).IsFixedLength();
            entity.Property(e => e.Value)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Aadhar)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Email1)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Email2)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.FirstName).IsFixedLength();
            entity.Property(e => e.Group).IsFixedLength();
            entity.Property(e => e.LandLine)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.LastName).IsFixedLength();
            entity.Property(e => e.MiddleName).IsFixedLength();
            entity.Property(e => e.Mobile1)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Mobile2)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Notes).IsFixedLength();
            entity.Property(e => e.OfficeNo)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Pan)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.Ssn)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
            entity.Property(e => e.WorkEmail)
                .IsFixedLength()
                .UseCollation("Latin1_General_BIN2");
        });

        modelBuilder.Entity<UserAddress>(entity =>
        {
            entity.HasOne(d => d.Address).WithMany(p => p.UserAddresses).HasConstraintName("FK_UserAddresses_UserAddresses1");

            entity.HasOne(d => d.User).WithMany(p => p.UserAddresses).HasConstraintName("FK_UserAddresses_UserAddresses");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
