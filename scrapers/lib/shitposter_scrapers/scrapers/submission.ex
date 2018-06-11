defmodule ShitposterScrapers.Submission do
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset

  schema "submissions" do
    field :submitted_id, :integer
    field :content_url, :string

    timestamps()
  end

  @doc false
  def changeset(scraper, attrs) do
    scraper
    |> cast(attrs, [:submitted_id, :content_url])
    |> validate_required([:content_url])
  end
end
