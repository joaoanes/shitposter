defmodule ShitposterBackend.RatingTest do
  use ShitposterBackend.ModelCase

  alias ShitposterBackend.Rating

  @valid_attrs %{emoji: "some emoji"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Rating.changeset(%Rating{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Rating.changeset(%Rating{}, @invalid_attrs)
    refute changeset.valid?
  end
end
