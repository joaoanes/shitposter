defmodule ShitposterBackend.Repo.Migrations.AddAuthenticatorToUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :is_authenticator, :boolean
    end
  end
end
