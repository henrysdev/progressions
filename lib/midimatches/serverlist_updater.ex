defmodule Midimatches.ServerlistUpdater do
  @moduledoc """
  Provides an actor-based timer for pushing out updates to the serverlist state
  """
  alias Midimatches.Rooms
  alias MidimatchesWeb.PresenceTracker

  alias __MODULE__

  use GenServer

  @default_update_cadence 3_000

  def start_link(args) do
    GenServer.start_link(ServerlistUpdater, args)
  end

  def init(_args) do
    Process.send_after(self(), {:serverlist_update}, @default_update_cadence)
    {:ok, %{}}
  end

  def handle_info({:serverlist_update}, state) do
    broadcast_serverlist_update()
    Process.send_after(self(), {:serverlist_update}, @default_update_cadence)
    {:noreply, state}
  end

  @spec broadcast_serverlist_update() :: :ok
  @doc """
  Triggers update of serverlist state to all listening clients
  """
  def broadcast_serverlist_update do
    room_states = Rooms.get_rooms_list()
    num_players_online = PresenceTracker.get_tracked_conns() |> length()

    MidimatchesWeb.Endpoint.broadcast(
      "matchmaking:serverlist",
      "serverlist_update",
      %{
        rooms: room_states,
        num_players_online: num_players_online
      }
    )
  end
end
