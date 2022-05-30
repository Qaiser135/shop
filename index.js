const Discord = require("discord.js")
const fs = require("fs")
const client = new Discord.Client();
const prefix = "!"
const data = require("./data.json")
const config = require("./config.json")
const owner = config.owner
const probot = config.probot
const token = config.token
const protax = require("pro-tax")


client.on("message", message => {
    if(!message.content.includes(prefix + "tax")) return
    const args = message.content.split(' ')
    const tax = args[1]
    if(!tax) return ("ادخل الرقم")
    message.reply(Math.floor(tax - protax.taxs(tax)))
})
client.on("message" , message => {
    if(!message.content.includes(prefix + "add")) return
    if(message.author.id != owner) return message.reply(`<@${owner}> هو الوحيد الذي يستطيع ان يضع حسابات`)
    const args = message.content.split(' ')
    const type = args[1]
    const Email = args[2]
    const Password = args[3]
    const Price = args[4]
    if(!type) return message.reply("Please Enter Account Type")
    if(!Email) return message.reply("Please Enter Email")
    if(!Password) return message.reply("Please Enter Password")
    if(!Price) return message.reply("Please Enter Price")
    const random = (len) => {
        var r = ''
        const all = ["1","2","3","4","5","6","7","8","9","0","q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M"]
        for(var i = 0; i < len; i++) {
            r+=all[Math.floor(Math.random() * all.length)]
        }
        return r
    }
    data[random(40)] = {
        "type" : type,
        "email" : Email,
        "password": Password,
        "owner" : message.author.id,
        "price": Price
    }
    fs.writeFile("./data.json", JSON.stringify(data,null,4), (err) => {
        if(err) console.log(err)
      });    
      message.delete()
    message.reply(`Done Add Data`)
})



client.on("message",message => {
    if(message.content != prefix + "buy") return
    const data2 = []
    const em = []
    const numbers = []
    const price = []
    const type = []
    var emails = []
    var passwords = []
    const keys = []
    var l = 1
    for(const key in data){
        data2.push({
            "type": data[key].type,
            "email": data[key].email,
            "password": data[key].password,
            "owner": data[key].owner,
            "price": data[key].price
        })
        em.push({item: `${l}- ${data[key].type} Acount / السعر : ${data[key].price}`})
        price.push({price: data[key].price})
        type.push({type: data[key].type})
        numbers.push(l)
        emails.push({email: data[key].email})
        passwords.push({password: data[key].password})
        keys.push({key: key})
        l+=1
    }
    // console.log(data2)
    // console.log(em)
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('white')
        .setTitle('Buy')
        .setDescription(`من فضلك اختار الحساب الذي تريد شرائه:\n\n${!data2.length === 0 ? "لا يوحد حسابات هنا" : em.map(i => i.item + "\n")}`)
        .setTimestamp()
        .setFooter(message.author.tag, message.author.avatarURL());
    message.channel.send(exampleEmbed).then(msg => {
        message.channel
          .awaitMessages(user => user.author.id === message.author.id, {
            max: 1,
            time: 1000 * 60,
            errors: ["time"]
          })
          .then(c => {
              var m = false
            for(var i = 0; i < price.length; i++){
              if(numbers[i] == c.first().content){
                  var key = keys[i].key
                    var em = emails[i].email
                    var ps = passwords[i].password
                    var type2 = type[i].type
                    m = true
                    var p = price[i].price
                    message.channel.send(`اكتب هذا الامر من فضلك امامك 3 دقائق للتحويل\n\n\`\`\`#credits <@!${owner}> ${price[i].price}\`\`\``).then(msg2 => {
                        message.channel.awaitMessages(user2 => user2.author.id === message.author.id, {
                            max: 1,
                            time: 3000 * 60,
                            errors: ["time"]
                        }).then(co => {
                            if(co.first().content != `#credits <@!${owner}> ${p}`) return message.reply("تم الغاء التحويل")
                            message.channel.awaitMessages(user3 => user3.author.id === probot, {
                                max: 1,
                                time: 5000,
                                errors: ["time"]  
                            }).then(col => {
                                message.channel.awaitMessages(user4 => user4.author.id === probot, {
                                    max: 1,
                                    time: 10000,
                                    errors: ["time"]  
                                }).then(col2 => {
                                    if(col2.first().content != `**:moneybag: | ${message.author.username}, has transferred \`$${Math.floor(p - protax.taxs(p))}\` to <@!${owner}> **`) return message.channel.send("تم الغاء العمليه")
                                    message.channel.send("تم ارسال الحساب بالخاص")
                                    message.author.send(`${type2} Account: \nEmail: ${em}\nPassword: ${ps}\nPrice: ${p}`)
                                    delete data[key]
                                    fs.writeFile("./data.json", JSON.stringify(data,null,4), (err) => {
                                        if(err) console.log(err)
                                      });    
                                }).catch(() => {
                                    message.channel.send("تم الغاء العمليه")
                                })
                            }).catch(() => {
                                message.channel.send("تم الغاء العمليه")
                            })
                        }).catch(() => {
                            message.channel.send("تم الغاء العمليه")
                        })
                    })
                }
            }
                if(!m) return message.channel.send("الرمز الذي ادخلته غير صحيح")
            }).catch(() => {
              message.reply("لقد نفد الوقت ولم يتم اختيار حساب")
          })
      });
})

client.login(token)
