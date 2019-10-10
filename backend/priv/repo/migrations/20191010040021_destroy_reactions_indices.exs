defmodule ShitposterBackend.Repo.Migrations.DestroyReactionsIndices do
  use Ecto.Migration

  def change do
    drop unique_index(:reactions, [:shitpost_id, :user_id])
  end
end
