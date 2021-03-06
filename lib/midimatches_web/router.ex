defmodule MidimatchesWeb.Router do
  use MidimatchesWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :auth_user_socket
    plug :put_user_socket_token
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  pipeline :public_pages_auth do
    plug :auth_conn
  end

  pipeline :user_pages_auth do
    plug :auth_conn, [:redirect_to_login]
  end

  pipeline :registered_user_pages_auth do
    plug :auth_conn, [:registered_only, :redirect_to_login]
  end

  pipeline :public_api_auth do
    plug :auth_conn
  end

  pipeline :registered_user_api_auth do
    plug :auth_conn, [:registered_only, :return_auth_error]
  end

  pipeline :auth_rate_limited do
    plug :rate_limit, request_limit: 10, bucket_time: 1000, auth_keyed?: true
  end

  scope "/", MidimatchesWeb do
    pipe_through :browser

    scope "/" do
      pipe_through :public_pages_auth
      get "/", PageController, :index
      get "/about", PageController, :about
      get "/privacy", PageController, :privacy
      get "/terms", PageController, :terms
      get "/leaderboard", PageController, :leaderboard
      get "/enter", PageController, :enter_player
      get "/account/recover", PageController, :recover_account
      get "/account/reset/:reset_token", PageController, :reset_password
    end

    scope "/" do
      pipe_through :user_pages_auth
      get "/menu", PageController, :menu
      get "/rooms", PageController, :serverlist
      get "/room/:room_id/play", PageController, :room_play
      get "/room/:room_id/watch", PageController, :room_watch
      get "/room/:room_id", PageController, :room
      get "/practice", PageController, :practice
    end

    scope "/" do
      pipe_through :registered_user_pages_auth
      get "/account", PageController, :account
    end
  end

  scope "/api", MidimatchesWeb do
    pipe_through :api

    get "/user/sync", UserController, :sync

    scope "/" do
      pipe_through :public_api_auth
      get "/user/self", UserController, :self
      post "/user", UserController, :upsert
      get "/samples/random", SampleController, :random
      post "/room", RoomController, :create

      post "/account/login", AccountController, :login
      post "/account/recovery", AccountController, :recovery
      post "/account", AccountController, :create

      get "/stats/rankings", StatsController, :rankings
    end

    scope "/account" do
      pipe_through :registered_user_api_auth
      get "/:uuid", AccountController, :show
      delete "/:uuid", AccountController, :delete

      scope "/" do
        pipe_through :auth_rate_limited
        put "/password", AccountController, :update_password
        put "/:uuid", AccountController, :update
        post "/logout", AccountController, :logout
      end
    end
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/api", MidimatchesWeb do
      pipe_through :api
      pipe_through :public_api_auth
      get "/user/reset", UserController, :reset
    end

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: MidimatchesWeb.Telemetry
    end
  end
end
