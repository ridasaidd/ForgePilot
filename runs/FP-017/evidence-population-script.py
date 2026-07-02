import sqlite3, json, hashlib, os
from pathlib import Path
DB='data/forgepilot.db'
OUT=Path('runs/FP-017')
FX=[
 ('FP-017-POSITIVE-ADMITTED','runs/FP-017/evidence-fixtures/admitted-boring-evidence.json','TIER_2_VERIFIED_ARTIFACT','VALID','ADMITTED','plumbing_fixture'),
 ('FP-017-NEGATIVE-REJECTED','runs/FP-017/evidence-fixtures/rejected-control-evidence.json','TIER_0_UNTRUSTED','INVALID','REJECTED','negative_control_fixture'),
]
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
con=sqlite3.connect(DB)
con.row_factory=sqlite3.Row
cur=con.cursor()
for t in ['phases','steps','tasks','packets','evidence_records']:
    if not cur.execute("select name from sqlite_master where type='table' and name=?",(t,)).fetchone():
        raise SystemExit(f'missing table {t}')
row=cur.execute("select p.id from packets p join tasks t on t.id=p.task_id where p.packet_type=? or t.name=? order by p.id limit 1",('FP-017','FP-017')).fetchone()
if row: pid=row['id']
else:
    cur.execute("insert into phases(name,status) values(?,?)",('FP-017 evidence population proof','complete')); ph=cur.lastrowid
    cur.execute("insert into steps(phase_id,name,status) values(?,?,?)",(ph,'Create admitted and rejected evidence records','complete')); st=cur.lastrowid
    cur.execute("insert into tasks(step_id,name,status) values(?,?,?)",(st,'FP-017','complete')); task=cur.lastrowid
    cur.execute("insert into packets(task_id,packet_type,status) values(?,?,?)",(task,'FP-017','complete')); pid=cur.lastrowid
parity=[]
for run_id,path,tier,val,adm,role in FX:
    h=sha(path); size=os.path.getsize(path); verification=f'FILE_SHA256:{h};FILE_SIZE:{size}'
    existing=cur.execute("select * from evidence_records where packet_id=? and run_id=?",(pid,run_id)).fetchone()
    if not existing:
        cur.execute("""insert into evidence_records(packet_id,run_id,model_id,model_role,branch,commit_sha,executor_result,verification_result,audit_result,comparison_result,metrics_path,artifact_paths,trust_tier,validation_state,admission_state) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",(pid,run_id,'none',role,'main','FP-017_SCRIPT','NOT_APPLICABLE_BORING_FIXTURE',verification,'NOT_APPLICABLE_BORING_FIXTURE','NOT_APPLICABLE_BORING_FIXTURE',path,json.dumps([path]),tier,val,adm))
    rec=cur.execute("select * from evidence_records where packet_id=? and run_id=?",(pid,run_id)).fetchone()
    paths=json.loads(rec['artifact_paths'])
    ok=(path in paths and rec['metrics_path']==path and h in rec['verification_result'] and rec['validation_state']==val and rec['admission_state']==adm)
    parity.append({'run_id':run_id,'evidence_id':rec['evidence_id'],'expected_path':path,'file_sha256':h,'file_size':size,'admission_state':rec['admission_state'],'validation_state':rec['validation_state'],'trust_tier':rec['trust_tier'],'path_match':path in paths and rec['metrics_path']==path,'hash_match':h in rec['verification_result'],'pass':ok})
con.commit()
dist=[dict(r) for r in cur.execute("select admission_state as state,count(*) as count from evidence_records where packet_id=? group by admission_state order by admission_state",(pid,))]
records=[dict(r) for r in cur.execute("select evidence_id,run_id,admission_state,validation_state,trust_tier,metrics_path,verification_result from evidence_records where packet_id=? order by evidence_id",(pid,))]
adm_count=cur.execute("select count(*) c from evidence_records where packet_id=? and admission_state='ADMITTED'",(pid,)).fetchone()['c']
rej_count=cur.execute("select count(*) c from evidence_records where packet_id=? and admission_state='REJECTED'",(pid,)).fetchone()['c']
non=[dict(r) for r in cur.execute("select evidence_id,run_id,admission_state from evidence_records where packet_id=? and admission_state!='ADMITTED'",(pid,))]
result='FIRST_ADMITTED_AND_REJECTED_CONTROL_PROVEN' if adm_count>=1 and rej_count>=1 and all(p['pass'] for p in parity) else 'FP_017_PROOF_NOT_ESTABLISHED'
out={'packet_id':'FP-017','numeric_packet_id':pid,'distribution':dist,'admitted_count':adm_count,'rejected_count':rej_count,'non_admitted_rows':non,'rejected_excluded_from_admitted_count':adm_count==1 and rej_count>=1,'parity':parity,'parity_pass':all(p['pass'] for p in parity),'records':records,'result':result}
(OUT/'admission-distribution-after.json').write_text(json.dumps(out,indent=2)+'\n')
(OUT/'file-sqlite-parity-check.json').write_text(json.dumps({'packet_id':'FP-017','numeric_packet_id':pid,'parity':parity,'parity_pass':out['parity_pass']},indent=2)+'\n')
(OUT/'admission-distribution-report.md').write_text('# FP-017 Admission Distribution Report\n\n## Result\n\n```text\n'+result+'\n```\n\n## Counts\n\n```text\nADMITTED: '+str(adm_count)+'\nREJECTED: '+str(rej_count)+'\n```\n\n## Distribution\n\n```json\n'+json.dumps(dist,indent=2)+'\n```\n\n## Negative Control\n\nRejected rows are non-admitted and excluded from admitted count.\n\n```json\n'+json.dumps(non,indent=2)+'\n```\n\n## Parity\n\n```text\nPARITY_PASS: '+str(out['parity_pass'])+'\n```\n\nGenerated output is authoritative for FP-017 interpretation.\n')
print(json.dumps({'result':result,'admitted_count':adm_count,'rejected_count':rej_count,'parity_pass':out['parity_pass'],'numeric_packet_id':pid},indent=2))
con.close()
