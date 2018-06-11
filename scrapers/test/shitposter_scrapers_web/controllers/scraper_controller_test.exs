defmodule ShitposterScrapersWeb.ScraperControllerTest do
  use ShitposterScrapersWeb.ConnCase

  alias ShitposterScrapers.Scrapers

  @create_attrs %{last_content_id: 42, last_page_id: 42, name: "some name"}
  @update_attrs %{last_content_id: 43, last_page_id: 43, name: "some updated name"}
  @invalid_attrs %{last_content_id: nil, last_page_id: nil, name: nil}

  def fixture(:scraper) do
    {:ok, scraper} = Scrapers.create_scraper(@create_attrs)
    scraper
  end

  describe "index" do
    test "lists all scrapers", %{conn: conn} do
      conn = get conn, scraper_path(conn, :index)
      assert html_response(conn, 200) =~ "Listing Scrapers"
    end
  end

  describe "new scraper" do
    test "renders form", %{conn: conn} do
      conn = get conn, scraper_path(conn, :new)
      assert html_response(conn, 200) =~ "New Scraper"
    end
  end

  describe "create scraper" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post conn, scraper_path(conn, :create), scraper: @create_attrs

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == scraper_path(conn, :show, id)

      conn = get conn, scraper_path(conn, :show, id)
      assert html_response(conn, 200) =~ "Show Scraper"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, scraper_path(conn, :create), scraper: @invalid_attrs
      assert html_response(conn, 200) =~ "New Scraper"
    end
  end

  describe "edit scraper" do
    setup [:create_scraper]

    test "renders form for editing chosen scraper", %{conn: conn, scraper: scraper} do
      conn = get conn, scraper_path(conn, :edit, scraper)
      assert html_response(conn, 200) =~ "Edit Scraper"
    end
  end

  describe "update scraper" do
    setup [:create_scraper]

    test "redirects when data is valid", %{conn: conn, scraper: scraper} do
      conn = put conn, scraper_path(conn, :update, scraper), scraper: @update_attrs
      assert redirected_to(conn) == scraper_path(conn, :show, scraper)

      conn = get conn, scraper_path(conn, :show, scraper)
      assert html_response(conn, 200) =~ "some updated name"
    end

    test "renders errors when data is invalid", %{conn: conn, scraper: scraper} do
      conn = put conn, scraper_path(conn, :update, scraper), scraper: @invalid_attrs
      assert html_response(conn, 200) =~ "Edit Scraper"
    end
  end

  describe "delete scraper" do
    setup [:create_scraper]

    test "deletes chosen scraper", %{conn: conn, scraper: scraper} do
      conn = delete conn, scraper_path(conn, :delete, scraper)
      assert redirected_to(conn) == scraper_path(conn, :index)
      assert_error_sent 404, fn ->
        get conn, scraper_path(conn, :show, scraper)
      end
    end
  end

  defp create_scraper(_) do
    scraper = fixture(:scraper)
    {:ok, scraper: scraper}
  end
end
