defmodule ShitposterScrapersWeb.ScraperController do
  use ShitposterScrapersWeb, :controller

  alias ShitposterScrapers.Scrapers
  alias ShitposterScrapers.Scrapers.Scraper

  def index(conn, _params) do
    scrapers = Scrapers.list_scrapers()
    render(conn, "index.html", scrapers: scrapers)
  end

  def new(conn, _params) do
    changeset = Scrapers.change_scraper(%Scraper{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"scraper" => scraper_params}) do
    case Scrapers.create_scraper(scraper_params) do
      {:ok, scraper} ->
        conn
        |> put_flash(:info, "Scraper created successfully.")
        |> redirect(to: scraper_path(conn, :show, scraper))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    scraper = Scrapers.get_scraper!(id)
    render(conn, "show.html", scraper: scraper)
  end

  def edit(conn, %{"id" => id}) do
    scraper = Scrapers.get_scraper!(id)
    changeset = Scrapers.change_scraper(scraper)
    render(conn, "edit.html", scraper: scraper, changeset: changeset)
  end

  def scrape(conn, %{"scraper_id" => id}) do
    scraper = Scrapers.get_scraper!(id)
    changeset = Scrapers.change_scraper(scraper)

    Task.Supervisor.async_nolink(ShitposterScrapers.TaskSupervisor, fn ->
      apply(String.to_existing_atom("Elixir.ShitposterScrapers.Scrapers.#{scraper.elixir_class_name}"), :scrape, [])
    end)

    conn
    |> put_flash(:info, "Scraper engaged.")
    |> redirect(to: scraper_path(conn, :show, scraper))
  end

  def update(conn, %{"id" => id, "scraper" => scraper_params}) do
    scraper = Scrapers.get_scraper!(id)

    case Scrapers.update_scraper(scraper, scraper_params) do
      {:ok, scraper} ->
        conn
        |> put_flash(:info, "Scraper updated successfully.")
        |> redirect(to: scraper_path(conn, :show, scraper))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", scraper: scraper, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    scraper = Scrapers.get_scraper!(id)
    {:ok, _scraper} = Scrapers.delete_scraper(scraper)

    conn
    |> put_flash(:info, "Scraper deleted successfully.")
    |> redirect(to: scraper_path(conn, :index))
  end
end
