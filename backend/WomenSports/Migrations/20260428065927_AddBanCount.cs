using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WomenSports.Migrations
{
    /// <inheritdoc />
    public partial class AddBanCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BanCount",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BanCount",
                table: "Users");
        }
    }
}
