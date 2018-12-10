defmodule ShitposterScrapers.Scrapers do
  @moduledoc """
  The Scrapers context.
  """

  import Ecto.Query, warn: false
  alias ShitposterScrapers.Repo

  alias ShitposterScrapers.Scrapers.Scraper

  @doc """
  Returns the list of scrapers.

  ## Examples

      iex> list_scrapers()
      [%Scraper{}, ...]

  """
  def list_scrapers do
    Repo.all(Scraper)
  end

  @doc """
  Gets a single scraper.

  Raises `Ecto.NoResultsError` if the Scraper does not exist.

  ## Examples

      iex> get_scraper!(123)
      %Scraper{}

      iex> get_scraper!(456)
      ** (Ecto.NoResultsError)

  """
  def get_scraper!(id), do: Repo.get!(Scraper, id)

  @doc """
  Creates a scraper.

  ## Examples

      iex> create_scraper(%{field: value})
      {:ok, %Scraper{}}

      iex> create_scraper(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_scraper(attrs \\ %{}) do
    %Scraper{}
    |> Scraper.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a scraper.

  ## Examples

      iex> update_scraper(scraper, %{field: new_value})
      {:ok, %Scraper{}}

      iex> update_scraper(scraper, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_scraper(%Scraper{} = scraper, attrs) do
    scraper
    |> Scraper.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Scraper.

  ## Examples

      iex> delete_scraper(scraper)
      {:ok, %Scraper{}}

      iex> delete_scraper(scraper)
      {:error, %Ecto.Changeset{}}

  """
  def delete_scraper(%Scraper{} = scraper) do
    Repo.delete(scraper)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking scraper changes.

  ## Examples

      iex> change_scraper(scraper)
      %Ecto.Changeset{source: %Scraper{}}

  """
  def change_scraper(%Scraper{} = scraper) do
    Scraper.changeset(scraper, %{})
  end

  def ok!(conditional) do
    case conditional do
      {:ok, res} -> res
      {:error, err} -> (
        throw err
      )
    end
  end

  def find_or_create(name, elixir_class_name) do
    query = from s in Scraper,
      where: s.name == ^name and s.elixir_class_name == ^elixir_class_name

    Repo.one(query) || (
      Scraper.changeset(%Scraper{}, %{ name: name, elixir_class_name: elixir_class_name })
      |> Repo.insert!
    )
  end
end
