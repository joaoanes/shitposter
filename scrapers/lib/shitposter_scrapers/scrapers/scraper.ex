defmodule ShitposterScrapers.Scrapers.Scraper do
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias ShitposterScrapers.Scrapers.Scraper
  alias ShitposterScrapers.Repo

  schema "scrapers" do
    field :last_content_id, :integer
    field :last_page_id, :integer
    field :current_thread_id, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(scraper, attrs) do
    scraper
    |> cast(attrs, [:name, :last_content_id, :last_page_id, :current_thread_id])
    |> validate_required([:name])
  end

end
