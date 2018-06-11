defmodule ShitposterScrapers.ScrapersTest do
  use ShitposterScrapers.DataCase

  alias ShitposterScrapers.Scrapers

  describe "scrapers" do
    alias ShitposterScrapers.Scrapers.Scraper

    @valid_attrs %{last_content_id: 42, last_page_id: 42, name: "some name"}
    @update_attrs %{last_content_id: 43, last_page_id: 43, name: "some updated name"}
    @invalid_attrs %{last_content_id: nil, last_page_id: nil, name: nil}

    def scraper_fixture(attrs \\ %{}) do
      {:ok, scraper} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Scrapers.create_scraper()

      scraper
    end

    test "list_scrapers/0 returns all scrapers" do
      scraper = scraper_fixture()
      assert Scrapers.list_scrapers() == [scraper]
    end

    test "get_scraper!/1 returns the scraper with given id" do
      scraper = scraper_fixture()
      assert Scrapers.get_scraper!(scraper.id) == scraper
    end

    test "create_scraper/1 with valid data creates a scraper" do
      assert {:ok, %Scraper{} = scraper} = Scrapers.create_scraper(@valid_attrs)
      assert scraper.last_content_id == 42
      assert scraper.last_page_id == 42
      assert scraper.name == "some name"
    end

    test "create_scraper/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Scrapers.create_scraper(@invalid_attrs)
    end

    test "update_scraper/2 with valid data updates the scraper" do
      scraper = scraper_fixture()
      assert {:ok, scraper} = Scrapers.update_scraper(scraper, @update_attrs)
      assert %Scraper{} = scraper
      assert scraper.last_content_id == 43
      assert scraper.last_page_id == 43
      assert scraper.name == "some updated name"
    end

    test "update_scraper/2 with invalid data returns error changeset" do
      scraper = scraper_fixture()
      assert {:error, %Ecto.Changeset{}} = Scrapers.update_scraper(scraper, @invalid_attrs)
      assert scraper == Scrapers.get_scraper!(scraper.id)
    end

    test "delete_scraper/1 deletes the scraper" do
      scraper = scraper_fixture()
      assert {:ok, %Scraper{}} = Scrapers.delete_scraper(scraper)
      assert_raise Ecto.NoResultsError, fn -> Scrapers.get_scraper!(scraper.id) end
    end

    test "change_scraper/1 returns a scraper changeset" do
      scraper = scraper_fixture()
      assert %Ecto.Changeset{} = Scrapers.change_scraper(scraper)
    end
  end
end
