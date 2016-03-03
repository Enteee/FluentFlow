# FluentFlow

## What is fluent flow?

FluentFlow is a filtering tool for json objects. The rules are written as "javascript functions" or using a fluent API (jquery like).  
The project was started with the intent to filter pdml output produced by wireshark (a network traffic capture & analysis tool). But the whole Matcher Core, Fluent API and the Unit tests are completely context free (= not limited to "network data").

## Usage

Configure your rules in rules.js. Afterwards start FluentFlow using one of the following methods:

### Sniff on live interface using tshark


```node main.js -i enp3s0``` (Replace enp3s0 with your interface)

### Read a pdml file

Pdml files can be generated using wireshark or tshark.
Afterwards you can read them like this:

```node main.js -p ./example.pdml```

### Read pdml from stdin

```tshark -i enp3s0 -T pdml   2> /dev/null | node main.js -p-```


## Quickstart Rules

In the simplest case, you register a single matcher function (with `matchOn`) which will be executed to check every packet.  
With `then` you can specify a callback which will be executed if the rule matched.

```
when.matchOn(function(packet) { //add callback which is used to check for matches on every packet
        //Do some checks here on packet struct
        return packet.tcp && packet.tcp.dstport==80; //return true on match
    }).then(function(packet) {
        console.log("Hey it matched",packet);
    });
```

To build more interesting rules you can describe the behaviour by using `followedBy`.
The second matcher function will have access to the packet of the first match.
An attached `then` function (at the end) will have access to both packets as well.

```
when.matchOn(function(packet) {
        //Do some checks here on packet struct
        return packet.tcp && packet.tcp.dstport==80; //return true on match
    }).followedBy.matchOn(function(packet,lastpacket){
        //Do some checks here on packet OR lastpacket struct
        return packet.http && packet.ip.src==lastpacket.ip.dst; //return true on match
    })
```

In general the callbacks registered with `matchOn` or `then` will get all packets of the previous matches (in the current chain) passed in, starting with the current packet.

## Using the FluentAPI to build the matcher function

Instead of using a callback function in matchOn you can also use the fluent API to automatically build a such function.

Here are some examples:

<!---

function printy(rule) {
    console.log("* `"+rule+"`  ");
    console.log("will translate into  ");
    console.log("`"+eval(rule+".toString()")+"`");
    console.log();
}

printy("packet.fieldNamed(\"tcp.dstport\").equals(80)");

-->


* `packet.fieldNamed("tcp.dstport").equals(80)`  
will translate into  
`function (packet){return (parseInt(packet.tcp.dstport)==80);}`

* `packet.fieldNamed("tcp.dstport").exists.and.equals(80)`  
will translate into  
`function (packet){return (packet && packet.tcp&& typeof(packet.tcp.dstport) != "undefined")&&(parseInt(packet.tcp.dstport)==80);}`

* `packet.fieldNamed("tcp.dstport").equals(80).or.equals(443)`  
will translate into  
`function (packet){return (parseInt(packet.tcp.dstport)==80)||(parseInt(packet.tcp.dstport)==443);}`

* `packet.fieldNamed("tcp.dstport").equals(lastPacket)`  
will translate into  
`function (packet,lastpacket){return (packet.tcp.dstport==lastpacket.tcp.dstport);}`

* `packet.fieldNamed("udp.src").exists.and.equals(lastPacket.fieldNamed("tcp.src"))`  
will translate into  
`function (packet,lastpacket){return (packet && packet.udp&& typeof(packet.udp.src) != "undefined")&&(packet.udp.src==lastpacket.tcp.src);}`

* `packet.fieldNamed("tcp.dstport").not.equals(lastPacket).or.equals(0)`  
will translate into  
`function (packet,lastpacket){return !(packet.tcp.dstport==lastpacket.tcp.dstport)||(parseInt(packet.tcp.dstport)==0);}`

* `packet.fieldNamed("tcp.dstport").between(0,1024)`  
will translate into  
`function (packet){return (parseInt(packet.tcp.dstport)>0&&parseInt(packet.tcp.dstport)<1024);}`

* `packet.fieldNamed("tcp.dstport").between(0,lastPacket)`  
will translate into  
`function (packet,lastpacket){return (parseInt(packet.tcp.dstport)>0&&parseInt(packet.tcp.dstport)<parseInt(lastpacket.tcp.dstport));}`

* `packet.fieldNamed("http.host").contains("foo")`  
will translate into  
`function (packet){return (packet.http.host.indexOf("foo")>=0);}`

* `packet.fieldNamed("http.host").not.matches(/abc\d+/).and.matches(/.*\.ch/)`  
will translate into  
`function (packet){return !(/abc\d+/.test(packet.http.host))&&(/.*\.ch/.test(packet.http.host));}`

  
Instead of using `fieldNamed("tcp.dstport")` you can also use `field.tcp.dstport`. This only works for properties which have been registered (TODO: explain).