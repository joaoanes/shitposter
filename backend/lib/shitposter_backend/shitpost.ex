defmodule ShitposterBackend.Shitpost do
  use Ecto.Schema
  import Ecto.Changeset
  alias ShitposterBackend.Shitpost
  alias ShitposterBackend.Repo
  alias ExAws.S3
  require Logger

  schema "shitposts" do
    field :url, :string
    field :permalink, :string
    field :name, :string
    field :type, :string #actually an enum!
    field :rating, :integer
    belongs_to :source, ShitposterBackend.Source
    belongs_to :submitter, ShitposterBackend.User

    timestamps()
  end

  @threshold 1

  @doc false
  def changeset(%Shitpost{} = shitpost, attrs) do
    shitpost
    |> cast(attrs, [:url, :type, :name, :submitter_id, :rating, :permalink])
    |> validate_required([:url, :type])
  end

  def create(url, name) do
    categorizerOutput = {:categorize, [url]}
    |> Honeydew.async(:categorizer, reply: true)
    |> Honeydew.yield

    case categorizerOutput do
      {:ok, type} -> Repo.insert(Shitpost.changeset(%Shitpost{}, %{url: url, type: type, name: name}))
      {:error, _} -> {:error, ["oops"]}
    end

  end

  def rate(id) do
    case Repo.get(Shitpost, id) do
      nil -> {:error, [id: "doesn't exist"]}
      %Shitpost{} = shitpost -> bump_rating(shitpost)
    end
  end

  defp bump_rating(%Shitpost{rating: rating} = shitpost) do
    rating = rating || 1
    new_shitpost = shitpost
    |> changeset(%{rating: rating+1})
    |> Repo.update

    case new_shitpost do
      {:ok, %Shitpost{permalink: p, rating: r} = shitpost} when r > @threshold and is_nil(p)-> host_permalink(shitpost)
      {:ok, %Shitpost{} = shitpost} -> {:ok, shitpost}
      _ -> {:error, ["oops!"]}
    end
  end

  defp host_permalink(%Shitpost{type: "webpage"} = shitpost) do
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "youtube"} = shitpost) do
    #TODO: youtube-dl support?
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "tweet"} = shitpost) do
    #TODO: archive.org support?
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "amp"} = shitpost) do
    #TODO: uhhhh
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "medium_post"} = shitpost) do
    #TODO uuhhhhhhhhhhh
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "facebook_post"} = shitpost) do
    #TODO UUUUUHHHHHHHHHHHH
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{url: url} = shitpost) do
    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        name = "#{Base.encode16(:crypto.hash(:md5, url))}"
        path = "/tmp/#{name}"
        File.write!(path, body)
        %{^path => fileInfo} = FileInfo.get_info(path)

        # IEx.pry
        %{status_code: 200} = S3.put_object(
          "shitposter-content",
          "content/#{name}",
          body,
          content_type: "#{fileInfo.type}/#{fileInfo.subtype}"
        )
        |> ExAws.request!

        set_permalink(
          shitpost,
          "https://s3.eu-central-1.amazonaws.com/shitposter-content/content/#{name}"
        )
      {:ok, %HTTPoison.Response{status_code: status_code}} ->
        {:error, [url: "server responded with #{status_code}"]}
      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, :we_have_no_idea_what_went_wrong}
    end
  end

  defp set_permalink(%Shitpost{permalink: p} = shitpost, permalink) when is_nil(p) do
    shitpost
    |> changeset(%{permalink: permalink})
    |> Repo.update
  end

  defp set_permalink(%Shitpost{id: id} = permalinked_shitpost, _) do
    Logger.warn {"why are we permalinking multiple times?", [id: id]}
    {:ok, permalinked_shitpost}
  end
end
