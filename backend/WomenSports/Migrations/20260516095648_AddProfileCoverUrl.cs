using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WomenSports.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileCoverUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileCoverUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileCoverUrl",
                table: "Users");
        }
    }
}
