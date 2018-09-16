defmodule ShitposterBackend.Guardian do
  use Guardian, otp_app: :shitposter_backend

  alias ShitposterBackend.Repo
  alias ShitposterBackend.User

  def subject_for_token(%User{id: id}, _claims) do
    {:ok, to_string(id)}
  end

  def subject_for_token(_, _) do
    {:error, :unknown_resource}
  end

  def resource_from_claims(%{"sub" => claimsSub}) do
    {:ok, Repo.get(User, claimsSub)}
  end

  def resource_from_claims(_claims) do
    {:error, :unknown_resource}
  end
end
