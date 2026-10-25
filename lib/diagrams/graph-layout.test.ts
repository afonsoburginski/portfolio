import assert from "node:assert/strict";
import { test } from "node:test";
import { architectureModel, layoutGraph } from "./graph-layout";

test("tmp", async () => {
  const m = architectureModel({type:"architecture",title:"t",description:"d",
    groups:[{id:"cp",label:"Control plane"},{id:"n1",label:"Node 1"}],
    nodes:[{id:"api",label:"API server",group:"cp"},{id:"etcd",label:"etcd",group:"cp"},{id:"p1",label:"pod a",group:"n1"},{id:"ing",label:"Ingress"}],
    edges:[{from:"ing",to:"p1",label:"HTTP"},{from:"api",to:"etcd"},{from:"api",to:"p1",label:"watch"}]} as never);
  const l = await layoutGraph(m);
  console.log(l.engine, l.width, l.height);
  console.log(l.nodes.map(n=>[n.id,n.x,n.y,n.w,n.h].join(",")).join("\n"));
  console.log(l.groups.map(n=>[n.id,n.x,n.y,n.w,n.h].join(",")).join("\n"));
  console.log(JSON.stringify(l.edges.map(e=>[e.id,e.points,e.labelAt])));
  assert.equal(l.engine, "elk");
});
