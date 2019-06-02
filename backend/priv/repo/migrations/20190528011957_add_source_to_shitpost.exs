defmodule ShitposterBackend.Repo.Migrations.AddSourceAndThumbnailToShitpost do
  use Ecto.Migration

  def change do
    alter table(:shitposts) do
      add :source_link, :string
    end
  end
end
