defmodule Progressions.ViewTimerTest do
  use ExUnit.Case

  alias Progressions.{
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GameServer,
    Types.GameRules
  }

  test "trigger view timeout and advanced views" do
    room_id = "1"
    musicians = MapSet.new(["1", "2", "3", "4"])
    game_rules = %GameRules{}
    timeout_duration = 10
    views = [:game_start, :round_start, :recording, :playback_voting, :round_end]

    {:ok, game_server} = GameServer.start_link([{room_id, musicians, game_rules}])
    {:ok, view_timer} = ViewTimer.start_link([{room_id}])

    {_ctr, actual_views} =
      Enum.reduce(
        views,
        {0, []},
        fn view, {ctr, acc_views} ->
          ViewTimer.schedule_view_timeout(view_timer, view, ctr, timeout_duration)

          Process.sleep(timeout_duration)

          curr_view = GameServer.get_current_view(game_server)

          {ctr + 1, [{view, curr_view} | acc_views]}
        end
      )

    expected_view = [
      {:game_start, :round_start},
      {:round_start, :recording},
      {:recording, :playback_voting},
      {:playback_voting, :round_end},
      {:round_end, :round_start}
    ]

    assert expected_view == Enum.reverse(actual_views)
  end
end
