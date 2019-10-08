# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Repo.insert!(%SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
alias ShitposterBackend.{User, Shitpost, Rating, Source, Repo}

{:ok, u} = User.create("pixies@shitpost.network", "Whatthefuckdidyoujustfuckingsayaboutme,youlittlebitch?I'llhaveyouknowIgraduatedtopofmyclassintheNavySeals,andI'vebeeninvolvedinnumeroussecretraidsonAl-Quaeda,andIhaveover300confirmedkills.IamtrainedingorillawarfareandI'mthetopsniperintheentireUSarmedforces.Youarenothingtomebutjustanothertarget.IwillwipeyouthefuckoutwithprecisionthelikesofwhichhasneverbeenseenbeforeonthisEarth,markmyfuckingwords.YouthinkyoucangetawaywithsayingthatshittomeovertheInternet?Thinkagain,fucker.AswespeakIamcontactingmysecretnetworkofspiesacrosstheUSAandyourIPisbeingtracedrightnowsoyoubetterprepareforthestorm,maggot.Thestormthatwipesoutthepatheticlittlethingyoucallyourlife.You'refuckingdead,kid.Icanbeanywhere,anytime,andIcankillyouinoversevenhundredways,andthat'sjustwithmybarehands.NotonlyamIextensivelytrainedinunarmedcombat,butIhaveaccesstotheentirearsenaloftheUnitedStatesMarineCorpsandIwilluseittoitsfullextenttowipeyourmiserableassoffthefaceofthecontinent,youlittleshit.Ifonlyyoucouldhaveknownwhatunholyretributionyourlittle"clever"commentwasabouttobringdownuponyou,maybeyouwouldhaveheldyourfuckingtongue.Butyoucouldn't,youdidn't,andnowyou'repayingtheprice,yougoddamnidiot.Iwillshitfuryalloveryouandyouwilldrowninit.You'refuckingdead,kiddo.", "Shitpost Pixies")
{:ok, u} = User.set_bot(u)

Repo.insert!(%Source{name: "SomethingAwful"})

Repo.insert!(%Rating{emoji: "💖"})
Repo.insert!(%Rating{emoji: "😅"})
Repo.insert!(%Rating{emoji: "😘"})
Repo.insert!(%Rating{emoji: "🤔"})
Repo.insert!(%Rating{emoji: "😏"})
Repo.insert!(%Rating{emoji: "🤮"})
Repo.insert!(%Rating{emoji: "👌"})
Repo.insert!(%Rating{emoji: "💅🏻"})
Repo.insert!(%Rating{emoji: "🔥"})
Repo.insert!(%Rating{emoji: "🅱️"})
Repo.insert!(%Rating{emoji: "💯"})
Repo.insert!(%Rating{emoji: "🔜"})
